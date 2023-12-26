import { ReactNode, useMemo, useCallback } from 'react'
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react'
import { WalletError, WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import useToastMessage from '@/hooks/useToastMessage'
import type { Adapter } from '@solana/wallet-adapter-base'
import type {
  SolanaSignInInput,
  SolanaSignInOutput,
} from '@solana/wallet-standard-features'
import { fetchSkeetFunctions } from '@/lib/skeet/functions'
import { CreateSignInDataParams } from '@common/types/http/createSignInDataParams'
import { VerifySIWSParams } from '@common/types/http/verifySIWSParams'
import { auth, db } from '@/lib/firebase'
import { signInWithCustomToken, signOut } from 'firebase/auth'
import { useRecoilState } from 'recoil'
import { defaultUser, userState } from '@/store/user'

type Props = {
  children: ReactNode
}

export const solanaNetwork = WalletAdapterNetwork.Mainnet
export const solanaEndpoint = 'https://api.mainnet-beta.solana.com'

export default function SolanaWalletProvider({ children }: Props) {
  const wallets = useMemo(() => [], [])
  const addToast = useToastMessage()
  const [_user, setUser] = useRecoilState(userState)

  const onError = useCallback(
    (error: WalletError) => {
      addToast({
        title: error.name,
        description: error.message,
        type: 'error',
      })
      console.error(error)
    },
    [addToast],
  )

  const autoSignIn = useCallback(
    async (adapter: Adapter) => {
      if (!('signIn' in adapter)) return true

      try {
        if (db && auth) {
          const createResponse =
            await fetchSkeetFunctions<CreateSignInDataParams>(
              'skeet',
              'createSignInData',
              {},
            )
          const signInResponse = await createResponse?.json()
          const input: SolanaSignInInput = signInResponse?.signInData
          const signInResult = await adapter.signIn(input)
          const output: SolanaSignInOutput = {
            ...signInResult,
            account: {
              address: signInResult.account.address,
              publicKey: signInResult.account.publicKey,
              chains: signInResult.account.chains,
              features: signInResult.account.features,
              label: signInResult.account.label,
              icon: signInResult.account.icon,
            },
          }
          const verifyResponse = await fetchSkeetFunctions<VerifySIWSParams>(
            'skeet',
            'verifySIWS',
            { input, output },
          )
          const success = await verifyResponse?.json()
          const userCredential = await signInWithCustomToken(
            auth,
            success?.token,
          )

          return false
        }
      } catch (err) {
        console.error(err)
        if (err instanceof Error) {
          addToast({
            title: err.name,
            description: err.message,
            type: 'error',
          })
        }
        if (auth) {
          setUser(defaultUser)
          await signOut(auth)
        }
      }
    },
    [addToast, setUser],
  )

  const autoConnect = useCallback(
    async (adapter: Adapter) => {
      adapter.autoConnect().catch((e) => {
        return autoSignIn(adapter)
      })
      return false
    },
    [autoSignIn],
  )

  return (
    <>
      <ConnectionProvider endpoint={solanaEndpoint}>
        <WalletProvider
          wallets={wallets}
          onError={onError}
          autoConnect={autoConnect}
        >
          <WalletModalProvider>{children}</WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </>
  )
}
