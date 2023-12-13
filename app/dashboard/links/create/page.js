'use client';
import { Listbox, Dialog, Transition } from '@headlessui/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

import UrlInput from '@/components/urlInput';

export default function AddLink() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [urls, setUrls] = useState(['']);
  const [tags, setTags] = useState(['']);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);

    if (
      code.match(/[^a-zA-Z0-9]/g) ||
      code === 'dashboard' ||
      code === 'login' ||
      code === 'signup'
    ) {
      setMessage('🚫 Invalid code');
      return;
    }

    const formData = new FormData();
    urls.forEach((url, index) => {
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        setMessage('🚫 Invalid URL: ' + url);
        return;
      }
      formData.append('code', code);
      formData.append(`url${index + 1}`, url);
      formData.append(`tag${index + 1}`, tags[index]);
    });

    try {
      const response = await fetch('/api/pendekmx/create', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      setMessage(`👏 Link creation succeeded. Redirecting...`);
      router.push(`/dashboard/links/${code}`);
    } catch (error) {
      setMessage(`😕 Oops! Something went wrong: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const addUrlInput = () => {
    setUrls([...urls, '']);
    setTags([...tags, '']);
  };

  const removeUrlInput = (index) => {
    setUrls(urls.filter((_, i) => i !== index));
    setTags(tags.filter((_, i) => i !== index));
  };

  const updateUrl = (index, url) => {
    const newUrls = [...urls];
    newUrls[index] = url;
    setUrls(newUrls);
  };

  const updateTag = (index, tag) => {
    const newTags = [...tags];
    newTags[index] = tag;
    setTags(newTags);
  };

  return (
    <div className='container mx-auto px-4 sm:px-6 lg:px-8 py-12'>
      <h1 className='text-2xl font-semibold text-gray-900'>Create new code</h1>

      <form onSubmit={handleSubmit} className='mt-8 space-y-6'>
        <div className='mt-1 relative rounded-md shadow-sm bg-black'>
          <label
            htmlFor='code'
            className='block text-lg font-medium text-white'
          >
            Code {message && <span className='text-red-500'>{message}</span>}
          </label>
          <input
            id='code'
            type='text'
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className='focus:ring-indigo-500 focus:border-indigo-500 w-1/2 pl-3 pr-12 text-lg text-black border-gray-700 rounded-md'
          />
        </div>

        {urls.map((url, index) => (
          <UrlInput
            key={index}
            urls={urls}
            url={url}
            tag={tags[index]}
            updateUrl={updateUrl}
            updateTag={updateTag}
            addUrlInput={addUrlInput}
            removeUrlInput={removeUrlInput}
            index={index}
          />
        ))}

        <div className='flex items-center justify-between'>
          <button
            type='submit'
            disabled={loading}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
              loading
                ? 'bg-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none'
            }`}
          >
            {loading ? (
              <svg
                className='animate-spin h-5 w-5 mr-3'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
              >
                <circle
                  className='opacity-25'
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  strokeWidth='4'
                ></circle>
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                ></path>
              </svg>
            ) : null}
            Create new link
          </button>
        </div>
      </form>
    </div>
  );
}
