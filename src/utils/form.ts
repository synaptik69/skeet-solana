import * as z from 'zod'

export const emailSchema = z.string().email()
export const passwordSchema = z.string().min(8)
export const usernameSchema = z.string().min(1).max(20)

export type GPTModel = 'gpt-3.5-turbo' | 'gpt-4'
export const allowedGPTModel: GPTModel[] = ['gpt-3.5-turbo', 'gpt-4']
export const gptModelSchema = z.union([
  z.literal('gpt-3.5-turbo'),
  z.literal('gpt-4'),
])

export const maxTokensSchema = z.number().int().min(100).max(4096)
export const temperatureSchema = z.number().min(0).max(2)
export const systemContentSchema = z.string().min(1).max(1000)
export const chatContentSchema = z.string().min(1).max(100000)

export type VertexModel = 'chat-bison@001'
export const allowedVertexModel: VertexModel[] = ['chat-bison@001']
// export const vertexModelSchema = z.union([z.literal('chat-bison@001')])
export const vertexModelSchema = z.literal('chat-bison@001')

export const vertexMaxTokensSchema = z.number().int().min(1).max(1024)
export const vertexTemperatureSchema = z.number().min(0).max(1)
export const vertexTopKSchema = z.number().min(1).max(40)
export const vertexTopPSchema = z.number().min(0).max(1)

export const vertexExampleInputOutputPairSchema = z.object({
  input: z.string().min(0).max(1000),
  output: z.string().min(0).max(1000),
})

export const vertexExampleFormSchema = z.object({
  inputOutputPairs: z.array(vertexExampleInputOutputPairSchema).min(1).max(100),
})
