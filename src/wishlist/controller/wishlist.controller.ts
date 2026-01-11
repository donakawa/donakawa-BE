import { Route, Tags } from "tsoa";
import { container } from "../../container";
import { WishlistService } from "../service/wishlist.service";

@Route("/wishlist")
@Tags("Wishlist")
export class HistoriesController {
  private readonly wishlistService: WishlistService =
    container.wishlist.service;
}
