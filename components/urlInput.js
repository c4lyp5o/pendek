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
    <div key={index} className='flex items-center border-b border-black py-2'>
      <input
        className='appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none'
        type='url'
        placeholder='Enter URL'
        value={url || ''}
        onChange={(e) => updateUrl(index, e.target.value)}
        required
      />
      <input
        className='ml-3 appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none'
        type='text'
        placeholder='Site Tag'
        value={tag || ''}
        onChange={(e) => updateTag(index, e.target.value)}
      />
      {index === urls.length - 1 && (
        <button
          type='button'
          onClick={addUrlInput}
          className='ml-2 bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded'
        >
          +
        </button>
      )}
      {urls.length > 1 && (
        <button
          type='button'
          onClick={() => removeUrlInput(index)}
          className='ml-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded'
        >
          -
        </button>
      )}
    </div>
  );
}
