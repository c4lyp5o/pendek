'use client';
import { Listbox, Dialog, Transition } from '@headlessui/react';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import useSWR from 'swr';
import QRCode from 'qrcode';

import DeleteModal from '@/app/dashboard/links/[code]/deleteModal';
import UrlInput from '@/components/urlInput';
import LoadingScreen from '@/components/loadingScreen';
import ErrorScreen from '@/components/errorScreen';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function EditLink() {
  const currentCode = usePathname();
  const router = useRouter();

  const [code, setCode] = useState('');
  const [originalCode, setOriginalCode] = useState('');
  const [urls, setUrls] = useState(['']);
  const [tags, setTags] = useState(['']);
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const url = `/api/pendekmx/${currentCode.split('/links/')[1]}`;
  const { data: link, error } = useSWR(url, fetcher, {
    refreshInterval: 1000,
  });

  useEffect(() => {
    const init = async () => {
      setCode(link.code);
      setOriginalCode(link.code);

      const urlsAndTags = link.urls.map((url) => ({
        url: url.url,
        tag: url.tag,
      }));
      setUrls(urlsAndTags.map((item) => ({ url: item.url })));
      setTags(urlsAndTags.map((item) => ({ tag: item.tag })));

      const qrCode = await QRCode.toDataURL(
        `${window.location.origin}/${link.code}`
      );
      setQrCode(qrCode);
    };

    if (link) {
      init();
    }
  }, [link]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    const formData = new FormData();
    urls.forEach((url, index) => {
      if (!url.url.startsWith('http://') && !url.url.startsWith('https://')) {
        setMessage('🚫 Invalid URL: ' + url);
        return;
      }
      formData.append('code', code);
      formData.append(`url${index + 1}`, url.url);
      formData.append(`tag${index + 1}`, tags[index].tag);
    });

    try {
      const response = await fetch(`/api/pendekmx/${link.id}`, {
        method: 'PATCH',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      if (originalCode !== code) {
        setMessage(
          '👏 Link updated successfully. Link code changed. Redirecting...'
        );
        router.push(`/dashboard/links/${code}`);
      } else {
        setMessage('👏 Link updated successfully.');
      }
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

  const updateUrl = (index, newUrl) => {
    setUrls((prevUrls) =>
      prevUrls.map((urlObj, i) =>
        i === index ? { ...urlObj, url: newUrl } : urlObj
      )
    );
  };

  const updateTag = (index, newTag) => {
    setTags((prevTags) =>
      prevTags.map((tagObj, i) =>
        i === index ? { ...tagObj, tag: newTag } : tagObj
      )
    );
  };

  if (error) return <ErrorScreen />;
  if (!link) return <LoadingScreen />;

  return (
    <div className='container mx-auto px-4 sm:px-6 lg:px-8 py-12'>
      <h1 className='text-2xl font-semibold text-gray-900'>Edit Code</h1>

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
            value={code || ''}
            onChange={(e) => setCode(e.target.value)}
            className='focus:ring-indigo-500 focus:border-indigo-500 w-1/2 pl-3 pr-12 text-lg text-black border-gray-700 rounded-md'
          />
          {qrCode && (
            <div className='mt-4'>
              <Image src={qrCode} width={250} height={250} alt='QR Code' />
            </div>
          )}
        </div>

        {urls.map((url, index) => (
          <UrlInput
            key={index}
            urls={urls}
            url={url.url}
            tag={tags[index].tag}
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
            Save edit
          </button>
          <DeleteModal code={link} />
        </div>
      </form>
    </div>
  );
}
