import { BaseRepository } from "./BaseRepository.js";

export class UsuarioRepository extends BaseRepository {
  constructor(storage) {
    super("usuarios", storage);
  }
}