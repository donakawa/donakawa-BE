import { TournamentsRepository } from "../repository/tournaments.repository";
import { FilesService } from "../../files/service/files.service";
import {
  CreateTournamentRequest,
  SelectTournamentRequest,
} from "../dto/request/tournaments.request.dto";
import {
  CreateTournamentResponse,
  TournamentDetailResponse,
  TournamentItemSummary,
  TournamentListResponse,
  TournamentResultResponse,
  TournamentRoundResponse,
  TournamentSelectResponse,
} from "../dto/response/tournaments.response.dto";
import { BadRequestException, NotFoundException } from "../../errors/error";

type TournamentItemRow = {
  id: bigint;
  slot: number;
  itemType: string;
  autoItem: { product: { name: string; price: number; photoFileId: bigint | null } } | null;
  manualItem: { name: string; price: number; photoFileId: bigint | null } | null;
};

type SelectionRow = { round: number; matchIndex: number; selectedItemId: bigint };

function totalRoundsFor(n: number): number {
  return Math.log2(n);
}

function computeCurrentState(
  totalItems: number,
  selectionsCount: number,
): { round: number; matchIndex: number; totalRounds: number; matchesInRound: number } {
  const totalRounds = totalRoundsFor(totalItems);
  let remaining = selectionsCount;

  for (let round = 1; round <= totalRounds; round++) {
    const matchesInRound = totalItems / Math.pow(2, round);
    if (remaining < matchesInRound) {
      return { round, matchIndex: remaining, totalRounds, matchesInRound };
    }
    remaining -= matchesInRound;
  }

  return { round: totalRounds, matchIndex: 0, totalRounds, matchesInRound: 1 };
}

function getItemForPosition(
  round: number,
  matchIndex: number,
  position: 0 | 1,
  items: TournamentItemRow[],
  selections: SelectionRow[],
): TournamentItemRow {
  if (round === 1) {
    return items.find((item) => item.slot === matchIndex * 2 + position)!;
  }
  const prevMatchIndex = matchIndex * 2 + position;
  const sel = selections.find((s) => s.round === round - 1 && s.matchIndex === prevMatchIndex)!;
  return items.find((item) => item.id === sel.selectedItemId)!;
}

async function toItemSummary(
  item: TournamentItemRow,
  filesService: FilesService,
): Promise<TournamentItemSummary> {
  let name: string;
  let price: number;
  let fileId: bigint | null = null;

  if (item.itemType === "AUTO") {
    name = item.autoItem!.product.name;
    price = item.autoItem!.product.price;
    fileId = item.autoItem!.product.photoFileId;
  } else {
    name = item.manualItem!.name;
    price = item.manualItem!.price;
    fileId = item.manualItem!.photoFileId;
  }

  const imageUrl = fileId
    ? await filesService.generateUrl(fileId.toString(), 60 * 60)
    : null;

  return {
    id: Number(item.id),
    slot: item.slot,
    type: item.itemType as "AUTO" | "MANUAL",
    name,
    price,
    imageUrl,
  };
}

export class TournamentsService {
  constructor(
    private readonly tournamentsRepository: TournamentsRepository,
    private readonly filesService: FilesService,
  ) {}

  async createTournament(
    userId: number,
    body: CreateTournamentRequest,
  ): Promise<CreateTournamentResponse> {
    const { items } = body;
    const count = items.length;

    if (count < 2 || (count & (count - 1)) !== 0) {
      throw new BadRequestException("T001", "아이템 수는 2의 제곱수(2, 4, 8, 16...)여야 합니다.");
    }

    const tournament = await this.tournamentsRepository.createTournament({
      userId,
      totalItems: count,
      items: items.map((item, i) => ({
        itemType: item.type,
        itemId: item.id,
        slot: i,
      })),
    });

    return {
      id: Number(tournament.id),
      createdAt: tournament.createdAt.toLocaleString("ko-KR", { timeZone: "Asia/Seoul" }),
    };
  }

  async getTournaments(userId: number): Promise<TournamentListResponse[]> {
    const tournaments = await this.tournamentsRepository.findTournamentsByUser(userId);

    return tournaments.map((t) => ({
      id: Number(t.id),
      totalItems: t.totalItems,
      isFinished: t.isFinished,
      createdAt: t.createdAt.toLocaleString("ko-KR", { timeZone: "Asia/Seoul" }),
    }));
  }

  async getTournamentDetail(id: number): Promise<TournamentDetailResponse> {
    const tournament = await this.tournamentsRepository.findTournamentDetail(id);
    if (!tournament) throw new NotFoundException("T002", "존재하지 않는 토너먼트입니다.");

    const totalRounds = totalRoundsFor(tournament.totalItems);
    const { round, matchIndex } = computeCurrentState(
      tournament.totalItems,
      tournament.selections.length,
    );

    const items = await Promise.all(
      tournament.items.map((item) => toItemSummary(item, this.filesService)),
    );

    return {
      id: Number(tournament.id),
      totalItems: tournament.totalItems,
      isFinished: tournament.isFinished,
      currentRound: round,
      totalRounds,
      currentMatchIndex: matchIndex,
      createdAt: tournament.createdAt.toLocaleString("ko-KR", { timeZone: "Asia/Seoul" }),
      items,
    };
  }

  async getCurrentRound(tournamentId: number): Promise<TournamentRoundResponse> {
    const tournament = await this.tournamentsRepository.findTournamentDetail(tournamentId);
    if (!tournament) throw new NotFoundException("T002", "존재하지 않는 토너먼트입니다.");
    if (tournament.isFinished)
      throw new BadRequestException("T003", "이미 완료된 토너먼트입니다.");

    const { round, matchIndex, totalRounds, matchesInRound } = computeCurrentState(
      tournament.totalItems,
      tournament.selections.length,
    );

    const leftItemRow = getItemForPosition(
      round,
      matchIndex,
      0,
      tournament.items,
      tournament.selections,
    );
    const rightItemRow = getItemForPosition(
      round,
      matchIndex,
      1,
      tournament.items,
      tournament.selections,
    );

    const [leftItem, rightItem] = await Promise.all([
      toItemSummary(leftItemRow, this.filesService),
      toItemSummary(rightItemRow, this.filesService),
    ]);

    return { round, totalRounds, matchIndex, matchesInRound, leftItem, rightItem };
  }

  async saveSelection(
    tournamentId: number,
    body: SelectTournamentRequest,
  ): Promise<TournamentSelectResponse> {
    const tournament = await this.tournamentsRepository.findTournamentDetail(tournamentId);
    if (!tournament) throw new NotFoundException("T002", "존재하지 않는 토너먼트입니다.");
    if (tournament.isFinished)
      throw new BadRequestException("T003", "이미 완료된 토너먼트입니다.");

    const { round, matchIndex } = computeCurrentState(
      tournament.totalItems,
      tournament.selections.length,
    );

    const leftItemRow = getItemForPosition(
      round,
      matchIndex,
      0,
      tournament.items,
      tournament.selections,
    );
    const rightItemRow = getItemForPosition(
      round,
      matchIndex,
      1,
      tournament.items,
      tournament.selections,
    );

    const validIds = [Number(leftItemRow.id), Number(rightItemRow.id)];
    if (!validIds.includes(body.selectedItemId)) {
      throw new BadRequestException("T004", "현재 라운드의 유효하지 않은 아이템입니다.");
    }

    const selectedItem = tournament.items.find((item) => Number(item.id) === body.selectedItemId)!;

    await this.tournamentsRepository.createSelection({
      tournamentId,
      round,
      matchIndex,
      selectedItemId: selectedItem.id,
    });

    const isFinished = tournament.selections.length + 1 >= tournament.totalItems - 1;
    if (isFinished) {
      await this.tournamentsRepository.finishTournament(tournamentId);
    }

    return { isFinished };
  }

  async getResult(tournamentId: number): Promise<TournamentResultResponse> {
    const tournament = await this.tournamentsRepository.findTournamentDetail(tournamentId);
    if (!tournament) throw new NotFoundException("T002", "존재하지 않는 토너먼트입니다.");
    if (!tournament.isFinished)
      throw new BadRequestException("T005", "아직 완료되지 않은 토너먼트입니다.");

    const totalRounds = totalRoundsFor(tournament.totalItems);
    const finalSelection = tournament.selections.find(
      (s) => s.round === totalRounds && s.matchIndex === 0,
    )!;

    const winner = tournament.items.find((item) => item.id === finalSelection.selectedItemId)!;
    return { winner: await toItemSummary(winner, this.filesService) };
  }

  async deleteTournament(tournamentId: number): Promise<{ message: string }> {
    const tournament = await this.tournamentsRepository.findTournamentDetail(tournamentId);
    if (!tournament) throw new NotFoundException("T002", "존재하지 않는 토너먼트입니다.");
    await this.tournamentsRepository.deleteTournament(tournamentId);
    return { message: "토너먼트가 삭제되었습니다." };
  }
}
