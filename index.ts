import { Pool, Client} from 'pg';
import Connection from './lib/connection';

export default function connect(pg: Pool | Client) {
  return new Connection(pg);
}