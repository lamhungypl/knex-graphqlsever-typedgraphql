import { Query, Resolver } from 'type-graphql';
import { books } from '../../data/data';
import { Book } from '../entities/Book';
@Resolver()
export class BookResolver {
  // constructor(private bookService: BookService) {}
  @Query(() => [Book])
  books() {
    return books;
  }
  @Query(() => Book)
  book() {
    return books[0];
  }
}
