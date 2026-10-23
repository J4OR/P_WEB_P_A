import { BaseRepository } from "./BaseRepository.js";
import { UsuarioModel } from "../models/usuarioModel.js";

export class UsuarioRepository extends BaseRepository {
  constructor(storage) {
    super(UsuarioModel, storage);
  }
}