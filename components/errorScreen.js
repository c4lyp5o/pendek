export default function ErrorScreen() {
  return (
    <div className='flex flex-col items-center justify-center min-h-screen text-center'>
      <span className='text-6xl' role='img' aria-label='frown'>
        😞
      </span>
      <h1 className='text-2xl mt-2'>Oops! Something went wrong.</h1>
      <p className='text-gray-500'>
        We`&apos;re working to fix this. Please try again later.
      </p>
    </div>
  );
}
