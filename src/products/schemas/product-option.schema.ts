import { Prop, Schema } from '@nestjs/mongoose';
import Chance from 'chance';
import { Types } from 'mongoose';

const chance = new Chance();

@Schema({
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
  timestamps: true,
  _id: false,
})
export class ProductOption {
  @Prop({ unique: true, default: chance.letter({ length: 6 }) })
  id?: string;

  @Prop()
  name: string;

  @Prop({ type: Types.Array<ProductOptionValue> })
  values: ProductOptionValue[];

  @Prop({ default: null })
  dataField?: string;
}

@Schema({
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
  timestamps: true,
  _id: false,
})
export class ProductOptionValue {
  @Prop({ unique: true, default: chance.letter({ length: 6 }) })
  id?: string;

  @Prop()
  name: string;

  @Prop()
  value: string;
}
