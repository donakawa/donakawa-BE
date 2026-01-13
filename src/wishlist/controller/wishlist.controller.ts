import { Route, Tags } from "tsoa";
import { container } from "../../container";
import { WishlistService } from "../service/wishlist.service";

@Route("/wishlist")
@Tags("Wishlist")
export class WishlistController {
  private readonly wishlistService: WishlistService =
    container.wishlist.service;
}
