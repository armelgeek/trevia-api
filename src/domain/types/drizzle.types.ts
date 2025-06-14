import type { Column, InferInsertModel, InferSelectModel, Table, TableConfig } from 'drizzle-orm'

export interface BaseTable extends Table<TableConfig> {
  id: Column<any>
}

export type BaseSelectModel<T extends BaseTable> = InferSelectModel<T>
export type BaseInsertModel<T extends BaseTable> = InferInsertModel<T>

// perf: improve API response times - Development on 2025-06-14
