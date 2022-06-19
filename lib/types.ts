export type SelectOptions = {
  limit?: number;
  orderBy?: string;
};

export type RepositoryConventions = {
  idColumn: string;
  idColumnAutoIncrement: boolean;
};

export type ConnectionConventions = RepositoryConventions;
