export class User {
  id: number;
  email: string;
  creation_date: Date;
  friendrequest_creation_date: Date;
  friendrequest_review_date: Date;
  friendrequest_accepted: boolean;
  friendrequest_orig_author_id: boolean;
  friendrequest_dest_author_id: boolean;
}