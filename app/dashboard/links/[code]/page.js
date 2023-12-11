'use client';
import { Listbox, Dialog, Transition } from '@headlessui/react';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import useSWR from 'swr';
import QRCode from 'qrcode';

import { withAuth } from '@/app/dashboard/withAuth';

import DeleteModal from './deleteModal';
import LoadingScreen from '@/components/loadingScreen';
import ErrorScreen from '@/components/errorScreen';

const fetcher = (url) =>
  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      return data;
    });

function UrlInput({
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

const EditLink = () => {
  const currentCode = usePathname();
  const router = useRouter();
  const [code, setCode] = useState('');
  const [originalCode, setOriginalCode] = useState('');
  const [urls, setUrls] = useState(['']);
  const [tags, setTags] = useState(['']);
  const [qrCode, setQrCode] = useState(null);
  const [message, setMessage] = useState('');

  const url = `/api/pendekmx/${currentCode.split('/links/')[1]}`;
  const { data: link, error } = useSWR(url, fetcher);

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

  if (error) return <ErrorScreen />;
  if (!link) return <LoadingScreen />;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      urls.forEach((url, index) => {
        if (!url.url.startsWith('http://') && !url.url.startsWith('https://')) {
          setMessage('Invalid URL: ' + url);
          return;
        }
        formData.append('code', code);
        formData.append(`url${index + 1}`, url.url);
        formData.append(`tag${index + 1}`, tags[index].tag);
      });

      await fetch(`/api/pendekmx/${link.id}`, {
        method: 'PATCH',
        body: formData,
      });

      if (originalCode !== code) {
        setMessage(
          'Link updated successfully. Link name changed. Redirecting...'
        );
        setTimeout(() => {
          router.push(`/dashboard/links/${code}`);
        }, 1000);
      } else {
        setMessage('Link updated successfully.');
      }
    } catch (error) {
      console.error(error);
      setMessage('Something went wrong. Please try again.');
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
              <img src={qrCode} alt='QR Code' />
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
            className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none'
          >
            Save
          </button>

          <DeleteModal code={link} />
        </div>
      </form>
    </div>
  );
};

export default withAuth(EditLink);
