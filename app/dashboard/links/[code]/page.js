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
                    <p className='text-white p-2'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 24 24'
                        strokeWidth='1.5'
                        stroke='#FFFFFF' // Change stroke color to white
                        className='w-6 h-6 ml-2 cursor-pointer'
                        onClick={handleCopy}
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          d='M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098 1.976-2.192a48.424 48.424 0 0 0-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5A3.375 3.375 0 0 0 6.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0 0 15 2.25h-1.5a2.251 2.251 0 0 0-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 0 0-9-9Z'
                        />
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
