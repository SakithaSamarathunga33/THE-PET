import Head from 'next/head'

export default function MyHead({ title, description, image, url }) {
    return (
        <Head>
            <title>{`${title} | THE PET`}</title>
            <meta name="description" content={description} />
            <meta property="og:title" content={title} key="title" />
            <meta property="og:description" content={description} key="description" />
            <meta property="og:image" content={image} key="image" />
            <meta property="og:url" content={url} key="url" />
            
            {/* Favicon settings for different devices and browsers */}
            <link rel="icon" type="image/png" href="/images/white2.png" sizes="32x32" />
            <link rel="mask-icon" href="/images/white2.png" color="#4DB6AC" />
            <link rel="apple-touch-icon" href="/images/white2.png" />
            <meta name="theme-color" content="#4DB6AC" />
            
            {/* For iOS web app */}
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-status-bar-style" content="black" />
            <meta name="apple-mobile-web-app-title" content="THE PET" />

            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />
            <meta name="twitter:card" content="summary_large_image" />

            {/* Custom styles for rounded favicon */}
            <style>{`
                link[rel="icon"] {
                    border-radius: 50%;
                    -webkit-mask-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50"/></svg>');
                    mask-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50"/></svg>');
                }
            `}</style>

            {/* Script to create rounded favicon */}
            <script src="/scripts/createRoundIcon.js" />
        </Head>
    )
}