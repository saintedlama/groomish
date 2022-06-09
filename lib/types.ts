export type SelectOptions = {
  limit?: number;
  orderBy?: string;
};

export type Predicates = { [key: string]: any };

export type RepositoryConventions = {
  idColumn: string;
  idColumnAutoIncrement: boolean;
};

export type ConnectionConventions = RepositoryConventions;
