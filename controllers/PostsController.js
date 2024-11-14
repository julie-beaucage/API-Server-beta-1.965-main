
import Repository from '../models/repository.js';
import Controller from './Controller.js';
import postModel from '../models/post.js';

export default class PostsController extends Controller {
    constructor(HttpContext) {
        super(HttpContext, new Repository(new postModel()));
    }
}