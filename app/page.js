'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import QRCode from 'qrcode';
import { toast } from 'react-toastify';

import UrlInput from '@/components/urlInput';

export default function Home() {
  const [urls, setUrls] = useState(['']);
  const [tags, setTags] = useState(['']);
  const [qrCode, setQrCode] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setUrls((prevUrls) => ['']);
    setTags((prevTags) => ['']);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    urls.forEach((url, index) => {
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        toast.error('🚫 Invalid URL: ' + url);
      }
      formData.append(`url${index + 1}`, url);
      formData.append(`tag${index + 1}`, tags[index]);
    });

    try {
      setLoading(true);

      const response = await fetch('/api/pendek', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      const shortLink = await response.json();

      const qrCode = await QRCode.toDataURL(
        `${window.location.origin}/${shortLink.code}`
      );
      setQrCode(qrCode);

      toast.success(`👏 Link creation succeeded.`);
      setMessage(
        `Your short URL is: ${window.location.origin}/${shortLink.code}. Please copy this code or save your qr code, it will only
            be shown once.`
      );

      reset();
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
    <main className='relative flex flex-col items-center justify-center min-h-screen py-2'>
      <div className='absolute top-4 right-4 flex'>
        <Link href='/signup'>
          <p className='mr-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'>
            Sign Up
          </p>
        </Link>
        <Link href='/login'>
          <p className='bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded'>
            Log In
          </p>
        </Link>
      </div>
      <h1 className='text-4xl mb-4'>B R G P D K</h1>
      <form onSubmit={handleSubmit} className='w-full max-w-md'>
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
        <button
          className={`flex-shrink-0 text-sm py-1 px-2 rounded mt-4 ${
            loading
              ? 'bg-gray-500 cursor-not-allowed'
              : 'bg-teal-500 hover:bg-teal-700 border-teal-500 hover:border-teal-700 text-white'
          }`}
          type='submit'
          disabled={loading}
        >
          {loading ? (
            <svg
              className='animate-spin h-5 w-5 text-white'
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
          ) : (
            'Shorten'
          )}
        </button>
      </form>
      {message && (
        <div
          className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-7'
          role='alert'
        >
          <strong className='font-bold'>Important!</strong>
          <span className='block sm:inline'> {message}.</span>
          <div className='mt-4 flex justify-center'>
            <Image src={qrCode} width={250} height={250} alt='QR Code' />
          </div>
        </div>
      )}
    </main>
  );
}
