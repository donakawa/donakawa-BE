import { GoalsRepository } from "../repository/goals.repository";

export class GoalsService {
  constructor(private readonly goalsRepository: GoalsRepository) {}
}
