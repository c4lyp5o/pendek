'use client';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import useSWR from 'swr';
import QRCode from 'qrcode';
import { toast } from 'react-toastify';

import DeleteModal from '@/app/dashboard/links/[code]/deleteModal';
import UrlInput from '@/components/urlInput';
import ExpandedQrCode from '@/components/expandedQrCode';
import LoadingScreenNoThanks from '@/components/loadingScreenNoThanks';
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const handleCopy = () => {
    navigator.clipboard.writeText(`${window.location.host}/${code}`);
    toast.success('👏 Link copied to clipboard');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      if (!url.url.startsWith('http://') && !url.url.startsWith('https://')) {
        toast.error(`🚫 Invalid URL: ${url}`);
        return;
      }
      formData.append('code', code);
      formData.append(`url${index + 1}`, url.url);
      formData.append(`tag${index + 1}`, tags[index].tag);
    });

    try {
      setLoading(true);

      const response = await fetch(`/api/pendekmx/${link.id}`, {
        method: 'PATCH',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      if (originalCode !== code) {
        toast.success('👏 Link updated successfully. Link code changed');
        router.push(`/dashboard/links/${code}`);
      } else {
        toast.success('👏 Link updated successfully');
      }
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
  if (!link) return <LoadingScreenNoThanks />;

  return (
    <form onSubmit={handleSubmit}>
      <div className='space-y-12'>
        <div className='border-b border-white/10 pb-12'>
          <h2 className='text-base font-semibold leading-7'>Editing link</h2>

          <div className='mt-5 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6'>
            <div className='sm:col-span-4 flex flex-col sm:flex-row items-center sm:justify-between'>
              <div className='w-full sm:w-auto'>
                <label
                  htmlFor='shortcode'
                  className='block text-sm font-medium leading-6'
                >
                  Shortcode
                </label>
                <div className='mt-2'>
                  <div className='flex flex-col sm:flex-row rounded-md bg-white/5 ring-1 ring-inset ring-white/10 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500'>
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
                      className='flex-1 border-0 bg-white py-1.5 pl-1 text-black focus:ring-0 sm:text-sm sm:leading-6'
                      placeholder='SuperDuperShortCode'
                    />
                    <p className='dark:text-white text-black'>
                      <svg
                        viewBox='0 0 24 24'
                        fill='none'
                        xmlns='http://www.w3.org/2000/svg'
                        className='my-auto w-4 h-4 cursor-pointer'
                        onClick={handleCopy}
                      >
                        <g id='SVGRepo_bgCarrier' strokeWidth='0'></g>
                        <g
                          id='SVGRepo_tracerCarrier'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                        ></g>
                        <g id='SVGRepo_iconCarrier'>
                          {' '}
                          <path
                            d='M10.25 2H13.75C14.9079 2 15.8616 2.87472 15.9862 3.99944L17.75 4C18.9926 4 20 5.00736 20 6.25V13.7108C19.9836 12.9693 19.4932 12.2915 18.7438 12.0711C17.8165 11.7984 16.8438 12.329 16.5711 13.2562L16.0582 15H15.3316C15.2339 14.7937 15.094 14.6033 14.9126 14.4421C14.1903 13.7999 13.0841 13.865 12.442 14.5874L10.442 16.8374C9.85266 17.5004 9.85266 18.4996 10.442 19.1627L12.442 21.4127C12.785 21.7985 13.2604 21.9968 13.739 22H6.25C5.00736 22 4 20.9926 4 19.75V6.25C4 5.00736 5.00736 4 6.25 4L8.01379 3.99944C8.13841 2.87472 9.09205 2 10.25 2ZM13.75 3.5H10.25C9.83579 3.5 9.5 3.83579 9.5 4.25C9.5 4.66421 9.83579 5 10.25 5H13.75C14.1642 5 14.5 4.66421 14.5 4.25C14.5 3.83579 14.1642 3.5 13.75 3.5Z'
                            fill='#212121'
                          ></path>{' '}
                          <path
                            d='M11.1894 18.4983L13.1894 20.7483C13.3376 20.9149 13.5433 21 13.75 21C13.9273 21.0001 14.1053 20.9376 14.2483 20.8106C14.5579 20.5354 14.5857 20.0613 14.3106 19.7517L12.7535 18L14.3106 16.2483C14.5857 15.9387 14.5579 15.4646 14.2483 15.1895C13.9465 14.9212 13.4884 14.9409 13.2106 15.2289C13.2058 15.2339 13.201 15.239 13.1963 15.2442C13.194 15.2467 13.1917 15.2492 13.1894 15.2517L11.1894 17.5017C11.1894 17.5017 11.1894 17.5017 11.1894 17.5017C10.9369 17.7859 10.9369 18.2141 11.1894 18.4983Z'
                            fill='#212121'
                          ></path>{' '}
                          <path
                            d='M17.5304 13.5383C17.6473 13.1409 18.0642 12.9136 18.4616 13.0304C18.5036 13.0428 18.5437 13.0585 18.5818 13.0772C18.6916 13.1312 18.7838 13.2101 18.8535 13.3047C18.9473 13.432 19.0002 13.5879 19.0002 13.75C19.0001 13.82 18.9902 13.8911 18.9695 13.9616L16.4695 22.4616C16.3526 22.859 15.9357 23.0864 15.5383 22.9695C15.1409 22.8526 14.9136 22.4357 15.0304 22.0383L17.5304 13.5383Z'
                            fill='#212121'
                          ></path>{' '}
                          <path
                            d='M19.7517 20.8105C19.4421 20.5354 19.4143 20.0613 19.6894 19.7517L21.2465 18L19.6894 16.2483C19.4143 15.9387 19.4421 15.4646 19.7517 15.1894C20.0613 14.9142 20.5354 14.9421 20.8106 15.2517L22.8106 17.5017C23.0631 17.7859 23.0631 18.2141 22.8106 18.4983L20.8106 20.7483C20.5354 21.0579 20.0613 21.0857 19.7517 20.8105Z'
                            fill='#212121'
                          ></path>{' '}
                        </g>
                      </svg>
                    </p>
                  </div>
                </div>
              </div>
              <div className='mt-8 sm:mt-0 w-full sm:w-auto flex justify-center sm:justify-end'>
                {qrCode && (
                  <div className='relative'>
                    <Image
                      className='h-64 w-64 flex-shrink-0 sm:h-32 sm:w-32'
                      src={qrCode}
                      alt='QR Code'
                      height='64'
                      width='64'
                      onClick={() => {
                        if (
                          typeof window !== 'undefined' &&
                          window.innerWidth > 640
                        ) {
                          setIsModalOpen(true);
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className='col-span-full'>
              <div>
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
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='mt-6 flex items-center justify-end gap-x-6'>
        <DeleteModal frontLoading={loading} code={link} />
        <button
          type='submit'
          disabled={loading}
          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm ${
            loading
              ? 'bg-gray-500 animate-pulse cursor-not-allowed'
              : 'rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500'
          }`}
        >
          Save
        </button>

        {isModalOpen && (
          <ExpandedQrCode
            qrCode={qrCode}
            setIsModalOpen={setIsModalOpen}
            isModalOpen={isModalOpen}
          />
        )}
      </div>
    </form>
  );
}
