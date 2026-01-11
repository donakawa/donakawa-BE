import { Route, Tags } from "tsoa";
import { container } from "../../container";
import { HistoriesService } from "../service/histories.service";

@Route("/histories")
@Tags("Histories")
export class HistoriesController {
  private readonly historiesService: HistoriesService =
    container.histories.service;
}
