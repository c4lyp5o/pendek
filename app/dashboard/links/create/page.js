'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

import UrlInput from '@/components/urlInput';

export default function AddLink() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [urls, setUrls] = useState(['']);
  const [tags, setTags] = useState(['']);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (urls.some((url) => !url)) {
      toast.error('🚫 URL is required');
      return;
    }

    if (code.match(/[^a-zA-Z0-9]|^(dashboard|login|signup|api)$/i)) {
      toast.error('🚫 Invalid code');
      return;
    }

    const formData = new FormData();
    urls.forEach((url, index) => {
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        toast.error(`🚫 Invalid URL: ${url}`);
        return;
      }
      formData.append('code', code);
      formData.append(`url${index + 1}`, url);
      formData.append(`tag${index + 1}`, tags[index]);
    });

    try {
      setLoading(true);

      const response = await fetch('/api/pendekmx/create', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      toast.success(`👏 Link creation succeeded`);
      router.push(`/dashboard/links/${code}`);
    } catch (error) {
      toast.error(`😕 Oops! ${error.message}`);
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
    <form onSubmit={handleSubmit}>
      <div className='space-y-12'>
        <div className='border-b border-white/10 pb-12'>
          <h1 className='text-base font-semibold leading-7 text-white'>
            Creating a new link
          </h1>

          <div className='mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6'>
            <div className='sm:col-span-4'>
              <label
                htmlFor='shortcode'
                className='block text-sm font-medium leading-6 text-white'
              >
                Shortcode
              </label>
              <div className='mt-2'>
                <div className='flex rounded-md bg-white/5 ring-1 ring-inset ring-white/10 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500'>
                  <span className='flex select-none items-center pl-3 text-gray-500 sm:text-sm'>
                    {window.location.host}/
                  </span>
                  <input
                    type='text'
                    name='shortcode'
                    id='shortcode'
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    autoComplete='shortcode'
                    className='flex-1 border-0 bg-transparent py-1.5 pl-1 text-white focus:ring-0 sm:text-sm sm:leading-6'
                    placeholder='SuperDuperShortCode'
                  />
                </div>
              </div>
            </div>

            <div className='col-span-full'>
              <div className='mt-2'>
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
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='mt-6 flex items-center justify-end gap-x-6'>
        <Link href='/dashboard/links'>
          <button
            type='button'
            className={`'w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white sm:ml-3 sm:w-auto sm:text-sm bg-red-600 hover:bg-red-700 focus:outline-none' ${
              loading && 'animate-pulse cursor-not-allowed'
            }`}
          >
            Cancel
          </button>
        </Link>
        <button
          type='submit'
          disabled={loading}
          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
            loading
              ? 'bg-gray-500 animate-pulse cursor-not-allowed'
              : 'rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm bg-indigo-500 hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500'
          }`}
        >
          Save
        </button>
      </div>
    </form>
  );
}
