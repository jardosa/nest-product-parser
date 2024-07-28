import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { nanoid } from 'nanoid';

export type ManufacturerDocument = HydratedDocument<Manufacturer>;

@Schema()
export class Manufacturer {
  @Prop({
    default: nanoid(),
  })
  manufacturerId?: string;

  @Prop()
  name: string;

  @Prop()
  manufacturerCode: string;
}
export const ManufacturerSchema = SchemaFactory.createForClass(Manufacturer);
