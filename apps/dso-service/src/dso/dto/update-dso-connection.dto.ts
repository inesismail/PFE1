import { PartialType } from '@nestjs/swagger';
import { CreateDsoConnectionDto } from './create-dso-connection.dto';

export class UpdateDsoConnectionDto extends PartialType(CreateDsoConnectionDto) {}
