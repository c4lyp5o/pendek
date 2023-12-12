# 🔗 B R G P D K Project 🔗

This is a URL shortener project built with [Next.js](https://nextjs.org/). It allows users to shorten long URLs and manage their links.

## 🚀 Getting Started 🚀

First, clone the repository to your local machine:

```bash
git clone https://github.com/c4lyp5o/pendek.git
```

Then, install the dependencies:

```bash
npm install
# or
yarn install
```

If this is your first time running the project, you need to create a `.env` file in the root directory. Example can be found in `.env.example`. You need to fill in the environment variables with your own values.

You would also need to migrate the database. Run the following command:

```bash
npx prisma migrate dev --name init
```

Then generate the Prisma client:

```bash
npx prisma generate
```

Finally, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open http://localhost:3000 with your browser to see the result.

## 🎯 Features 🎯

- User registration and authentication
- URL shortening (public and private)
- Link management

## ⚠️ Known Issues ⚠️

If there are any known issues or limitations with the project, list them here.

## 🤝 Contributing 🤝

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change. Please make sure to update tests as appropriate.

Here's how you can contribute to the project:

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License 📝

[MIT](https://choosealicense.com/licenses/mit/)
