// 'use client';

// import { useForm } from '@conform-to/react';
// import { parse } from '@conform-to/zod';
// import { createPost, updatePost } from '@/app/posts/actions';
// import { postSchema } from '@/types/post';
// import type { PostEntity } from '@/types/post';
// import type { Category } from '@/types/category';
// import type { Tag } from '@/types/tag';
// import { toast } from '@/components/ui/toast';

// interface PostFormProps {
//   post?: PostEntity;
//   categories: Category[];
//   tags: Tag[];
// }

// export function PostForm({ post, categories, tags }: PostFormProps) {
//   const [form, fields] = useForm({
//     id: 'post-form',
//     defaultValue: post,
//     onSubmit: async (event: React.FormEvent<HTMLFormElement>) => {
//       event.preventDefault();

//       const formData = new FormData(event.currentTarget);
//       const submission = parse(formData, { schema: postSchema });

//       if (!submission.value || submission.intent !== 'submit') {
//         return;
//       }

//       const result = post?.id
//         ? await updatePost(post.id, formData)
//         : await createPost(formData);

//       if (result.success) {
//         toast.success('Post saved successfully');
//         // Redirect or update UI
//       } else {
//         toast.error(result.error || 'Failed to save post');
//       }
//     },
//   });

//   return (
//     <form
//       {...form.props}
//       className="space-y-6"
//     >
//       <div>
//         <label
//           htmlFor={fields.title.id}
//           className="block text-sm font-medium text-gray-700"
//         >
//           Title
//         </label>
//         <input
//           {...fields.title}
//           type="text"
//           className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
//         />
//         {fields.title.error && (
//           <p className="mt-2 text-sm text-red-600">{fields.title.error}</p>
//         )}
//       </div>

//       <div>
//         <label
//           htmlFor={fields.content.id}
//           className="block text-sm font-medium text-gray-700"
//         >
//           Content
//         </label>
//         <textarea
//           {...fields.content}
//           rows={8}
//           className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
//         />
//         {fields.content.error && (
//           <p className="mt-2 text-sm text-red-600">{fields.content.error}</p>
//         )}
//       </div>

//       <div>
//         <fieldset>
//           <legend className="text-sm font-medium text-gray-700">
//             Categories
//           </legend>
//           <div className="mt-2 space-y-2">
//             {categories.map((category) => (
//               <label
//                 key={category.id}
//                 className="inline-flex items-center"
//               >
//                 <input
//                   type="checkbox"
//                   name="categories"
//                   value={category.id}
//                   defaultChecked={post?.categories?.some(
//                     (c) => c.id === category.id
//                   )}
//                   className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
//                 />
//                 <span className="ml-2 text-sm text-gray-700">
//                   {category.name}
//                 </span>
//               </label>
//             ))}
//           </div>
//         </fieldset>
//       </div>

//       <div>
//         <fieldset>
//           <legend className="text-sm font-medium text-gray-700">Tags</legend>
//           <div className="mt-2 space-y-2">
//             {tags.map((tag) => (
//               <label
//                 key={tag.id}
//                 className="inline-flex items-center"
//               >
//                 <input
//                   type="checkbox"
//                   name="tags"
//                   value={tag.id}
//                   defaultChecked={post?.tags?.some((t) => t.id === tag.id)}
//                   className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
//                 />
//                 <span className="ml-2 text-sm text-gray-700">{tag.name}</span>
//               </label>
//             ))}
//           </div>
//         </fieldset>
//       </div>

//       <div className="flex items-center justify-end space-x-3">
//         <button
//           type="submit"
//           className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
//         >
//           {post?.id ? 'Update Post' : 'Create Post'}
//         </button>
//       </div>
//     </form>
//   );
// }
