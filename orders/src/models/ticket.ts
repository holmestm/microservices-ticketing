import mongoose from 'mongoose';
// This is the Orders service collection of Ticket data

// an interface that describes the properties that are required to create a new Ticket
interface TicketAttrs {
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
}

const TicketSchema = new mongoose.Schema(
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

TicketSchema.statics.build = (attrs: TicketAttrs) => {
  return new Ticket(attrs);
};

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', TicketSchema);

export { Ticket, TicketDoc, TicketAttrs };
