'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

function DeleteModal({ code }) {
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
      <span
        onClick={() => setIsOpen(true)}
        className='ml-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600'
      >
        Delete
      </span>

      {isOpen && (
        <div className='fixed z-10 inset-0 overflow-y-auto flex items-center justify-center bg-black bg-opacity-50'>
          {/* ... */}
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
                {code.urls.map((singleUrl, index) => (
                  <p key={index} className='mt-1 text-sm text-gray-900'>
                    URL: {singleUrl.url}
                  </p>
                ))}
              </div>
            </div>
            <div className='bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse'>
              <button
                onClick={handleDelete}
                disabled={loading}
                className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white sm:ml-3 sm:w-auto sm:text-sm ${
                  loading
                    ? 'bg-gray-500 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700 focus:outline-none'
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
                Delete
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className='mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm'
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

export default DeleteModal;
