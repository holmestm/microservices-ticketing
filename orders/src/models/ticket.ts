import mongoose from 'mongoose';
import { Order, OrderStatus } from './order';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

// This is the Orders service collection of Ticket data

// an interface that describes the properties that are required to create a new Ticket
interface TicketAttrs {
  id: string;
  title: string;
  price: number;
}

// An interface that describes the properties
// that a Ticket model has

interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc;
}

// An interface that describes the properties
// that a TicketDocument has

interface TicketDoc extends mongoose.Document {
  title: string;
  price: number;
  version: number;
  isReserved(): Promise<boolean>;
}

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);
ticketSchema.set('versionKey', 'version');
// comment out to do version control ourselves
ticketSchema.plugin(updateIfCurrentPlugin);

/*
// manual version control
ticketSchema.pre('save', function (done) {
  // @ts-ignore
  this.$where = {
    version: this.get('version') - 1,
  };

  done();
});
*/
ticketSchema.statics.build = (attrs: TicketAttrs) => {
  let a: any = attrs;
  if (a.id) {
    a['_id'] = attrs.id;
    delete a.id;
  }
  return new Ticket(a);
};
ticketSchema.methods.isReserved = async function () {
  const existingOrder = await Order.findOne({
    ticket: this,
    status: {
      $in: [
        OrderStatus.Created,
        OrderStatus.AwaitingPayment,
        OrderStatus.Complete,
      ],
    },
  });

  return !!existingOrder;
};

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket, TicketDoc, TicketAttrs };
