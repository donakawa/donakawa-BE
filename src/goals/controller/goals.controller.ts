import { Route, Tags } from "tsoa";
import { container } from "../../container";
import { GoalsService } from "../service/goals.service";

@Route("/goals")
@Tags("Goals")
export class GoalsController {
  private readonly goalsService: GoalsService = container.goals.service;
}
