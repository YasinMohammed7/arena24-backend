import { PartialType, OmitType } from "@nestjs/swagger";
import { CreateReviewDto } from "./create-review.dto";

// Everything from create except locationId (a review's location is immutable).
export class UpdateReviewDto extends PartialType(
  OmitType(CreateReviewDto, ["locationId"] as const)
) {}
