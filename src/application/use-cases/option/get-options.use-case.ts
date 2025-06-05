import { db } from '../../../infrastructure/database/db/index'
import { options } from '../../../infrastructure/database/schema/schema'

interface OptionData {
  id: string
  name: string
  description: string | null
  extraPrice: string | null
  optionType: string | null
}

interface GetOptionsOutput {
  success: boolean
  data?: OptionData[]
  error?: string
}

export class GetOptionsUseCase {
  public async execute(): Promise<GetOptionsOutput> {
    try {
      const allOptions = await db.select().from(options)

      const formattedOptions: OptionData[] = allOptions.map((option) => ({
        id: option.id,
        name: option.name || '',
        description: option.description,
        extraPrice: option.extraPrice,
        optionType: option.optionType
      }))

      return {
        success: true,
        data: formattedOptions
      }
    } catch (error: any) {
      console.error('Erreur lors de la récupération des options:', error)
      return { success: false, error: error.message || 'Erreur interne du serveur' }
    }
  }
}

// fix: reservation edge cases - Development on 2025-06-05
