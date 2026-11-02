import {BaseEntity} from '../../../shared/domain/model/base-entity';

/**
 * Represents a question sent by a visitor from the public contact us page.
 */
export class ContactInquiry implements BaseEntity {
  /**
   * Unique identifier of the inquiry.
   */
  #id: number;

  /**
   * Full name of the visitor.
   */
  #fullName: string;

  /**
   * Email the team uses to answer the inquiry.
   */
  #email: string;

  /**
   * Question written by the visitor.
   */
  #message: string;

  /**
   * Status of the inquiry (received or answered).
   */
  #status: string;

  /**
   * Date and time the inquiry was received (ISO 8601).
   */
  #receivedAt: string;

  /**
   * Creates a new contact inquiry.
   * @param inquiry - Initial values of the inquiry.
   */
  constructor(inquiry: { id: number; fullName: string; email: string; message: string; status: string; receivedAt: string }) {
    this.#id = inquiry.id;
    this.#fullName = inquiry.fullName;
    this.#email = inquiry.email;
    this.#message = inquiry.message;
    this.#status = inquiry.status;
    this.#receivedAt = inquiry.receivedAt;
  }

  get id(): number { return this.#id; }
  set id(value: number) { this.#id = value; }

  get fullName(): string { return this.#fullName; }
  set fullName(value: string) { this.#fullName = value; }

  get email(): string { return this.#email; }
  set email(value: string) { this.#email = value; }

  get message(): string { return this.#message; }
  set message(value: string) { this.#message = value; }

  get status(): string { return this.#status; }
  set status(value: string) { this.#status = value; }

  get receivedAt(): string { return this.#receivedAt; }
  set receivedAt(value: string) { this.#receivedAt = value; }
}
