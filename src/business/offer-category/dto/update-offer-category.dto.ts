import { PartialType } from "@nestjs/swagger";
import { CreateOfferCategoryDto } from "./create-offer-category.dto";

export class UpdateOfferCategoryDto extends PartialType(
  CreateOfferCategoryDto
) {}
