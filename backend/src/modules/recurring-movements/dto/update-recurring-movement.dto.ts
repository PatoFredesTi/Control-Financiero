import { PartialType } from '@nestjs/mapped-types';
import { CreateRecurringMovementDto } from './create-recurring-movement.dto';

export class UpdateRecurringMovementDto extends PartialType(CreateRecurringMovementDto) {}
