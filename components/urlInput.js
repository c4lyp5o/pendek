export default function UrlInput({
  urls,
  url,
  tag,
  updateUrl,
  updateTag,
  addUrlInput,
  removeUrlInput,
  index,
}) {
  return (
    <ul role='list' className='divide-y divide-gray-800'>
      <li key={index} className='flex justify-between gap-x-6 py-5'>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <div>
            <label
              htmlFor='url'
              className='block text-sm font-medium leading-6 text-white'
            >
              URL
            </label>
            <div className='mt-2'>
              <input
                type='url'
                name='url'
                id='url'
                value={url || ''}
                onChange={(e) => updateUrl(index, e.target.value)}
                className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                placeholder='Example: https://www.google.com'
                required
              />
            </div>
          </div>
          <div>
            <div className='flex justify-between'>
              <label
                htmlFor='tag'
                className='block text-sm font-medium leading-6 text-white'
              >
                Site Tag
              </label>
              <span
                className='text-sm leading-6 text-gray-500'
                id='tag-optional'
              >
                Optional
              </span>
            </div>
            <div className='mt-2'>
              <input
                type='tag'
                name='tag'
                id='tag'
                value={tag || ''}
                onChange={(e) => updateTag(index, e.target.value)}
                className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                placeholder='Example: Google'
                aria-describedby='tag-optional'
              />
            </div>
          </div>
        </div>
        <div className='flex flex-col items-end space-y-2'>
          {index === urls.length - 1 && (
            <button
              onClick={addUrlInput}
              className='text-sm leading-6 text-white rounded-md'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='currentColor'
                className='w-6 h-6'
              >
                <path
                  fillRule='evenodd'
                  d='M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z'
                  clipRule='evenodd'
                />
              </svg>
            </button>
          )}
          {urls.length > 1 && (
            <button
              onClick={() => removeUrlInput(index)}
              className='text-sm leading-6 text-white rounded-md mt-2'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='currentColor'
                className='w-6 h-6'
              >
                <path
                  fillRule='evenodd'
                  d='M3.75 12a.75.75 0 01.75-.75h15a.75.75 0 010 1.5h-15a.75.75 0 01-.75-.75z'
                  clipRule='evenodd'
                />
              </svg>
            </button>
          )}
        </div>
      </li>
    </ul>
  );
}
