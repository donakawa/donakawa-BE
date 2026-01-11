import { container } from "../../container";
import { AuthRepository } from "../repository/auth.repository";

export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}
  public hello() {
    return "hello Donakawa!";
  }
}
