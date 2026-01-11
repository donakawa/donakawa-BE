import { WishlistRepository } from "../repository/wishlist.repository";

export class WishlistService {
  constructor(private readonly wishlistRepository: WishlistRepository) {}
}
