import {
  Body,
  Delete,
  Get,
  Path,
  Post,
  Route,
  Tags,
  Security,
  Request,
} from "tsoa";
import { Request as ExpressRequest } from "express";

import { container } from "../../container";
import { TournamentsService } from "../service/tournaments.service";
import {
  CreateTournamentRequest,
  SelectTournamentRequest,
} from "../dto/request/tournaments.request.dto";

@Route("/tournaments")
@Security("jwt")
@Tags("Tournaments")
export class TournamentsController {
  private readonly tournamentsService: TournamentsService = container.tournaments.service;

  /**
   * @summary 토너먼트 생성
   * @description 위시 아이템 목록으로 이상형 월드컵 토너먼트를 생성합니다. 아이템 수는 2의 제곱수(2, 4, 8, 16...)여야 합니다.
   */
  @Post()
  async createTournament(
    @Body() body: CreateTournamentRequest,
    @Request() req: ExpressRequest,
  ) {
    const userId = Number(req.user!.id);
    return this.tournamentsService.createTournament(userId, body);
  }

  /**
   * @summary 토너먼트 목록 조회
   */
  @Get()
  async getTournaments(@Request() req: ExpressRequest) {
    const userId = Number(req.user!.id);
    return this.tournamentsService.getTournaments(userId);
  }

  /**
   * @summary 토너먼트 상세 조회
   */
  @Get("/{id}")
  async getTournamentDetail(@Path() id: number) {
    return this.tournamentsService.getTournamentDetail(id);
  }

  /**
   * @summary 토너먼트 기록 삭제
   */
  @Delete("/{id}")
  async deleteTournament(@Path() id: number) {
    return this.tournamentsService.deleteTournament(id);
  }

  /**
   * @summary 라운드 조회
   * @description 현재 라운드에서 비교할 두 아이템을 반환합니다.
   */
  @Get("/{id}/round")
  async getRound(@Path() id: number) {
    return this.tournamentsService.getCurrentRound(id);
  }

  /**
   * @summary 버튼 선택 저장
   * @description 현재 매치에서 선택한 아이템을 저장합니다. selectedItemId는 TournamentItem의 id입니다.
   */
  @Post("/{id}/select")
  async saveSelection(@Path() id: number, @Body() body: SelectTournamentRequest) {
    return this.tournamentsService.saveSelection(id, body);
  }

  /**
   * @summary 최종 선택 조회
   * @description 토너먼트가 완료된 후 최종 우승 아이템을 반환합니다.
   */
  @Get("/{id}/result")
  async getResult(@Path() id: number) {
    return this.tournamentsService.getResult(id);
  }
}
