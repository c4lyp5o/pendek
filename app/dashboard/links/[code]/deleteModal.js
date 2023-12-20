'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

export default function DeleteModal({ code, frontLoading }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = () => {
    const deleteLink = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/pendekmx/${code.code}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setIsOpen(false);
          toast.success('👏 Link deletion succeeded');
        } else {
          console.error('Failed to delete link');
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(true);
        router.push('/dashboard/links');
      }
    };

    deleteLink();
  };

  return (
    <div>
      <button
        type='button'
        onClick={() => setIsOpen(true)}
        className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white sm:ml-3 sm:w-auto sm:text-sm bg-red-600 hover:bg-red-700 focus:outline-none ${
          frontLoading && 'animate-pulse cursor-not-allowed'
        }`}
      >
        Delete
      </button>

      {isOpen && (
        <div className='fixed z-10 inset-0 overflow-y-auto flex items-center justify-center bg-black bg-opacity-50 p-4 sm:p-0'>
          <div className='bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full'>
            <div className='bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4'>
              <h3 className='text-lg leading-6 font-medium text-gray-900'>
                Delete Code
              </h3>
              <div className='mt-2'>
                <p className='text-sm text-gray-500'>
                  Are you sure you want to delete the following code and its
                  URLs?
                </p>
                <p className='mt-1 text-sm text-gray-900'>Code: {code.code}</p>
                {code.urls.map((singleUrl) => (
                  <ul key={singleUrl.url}>
                    <p className='mt-1 text-sm text-gray-900'>
                      {singleUrl.url}
                    </p>
                  </ul>
                ))}
              </div>
            </div>
            <div className='bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse'>
              <button
                onClick={handleDelete}
                disabled={loading}
                className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white sm:ml-3 sm:w-auto sm:text-sm ${
                  loading
                    ? 'bg-gray-500 animate-pulse cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700 focus:outline-none'
                }`}
              >
                Yes I`&apos;` sure!
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className={`mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm ${
                  loading && 'animate-pulse cursor-not-allowed'
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
