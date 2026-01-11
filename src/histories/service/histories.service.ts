import { HistoriesRepository } from "../repository/histories.repository";

export class HistoriesService {
  constructor(private readonly historiesRepository: HistoriesRepository) {}
}
