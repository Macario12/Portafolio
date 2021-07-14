var ghpages = require('gh-pages');

ghpages.publish(
    'public', // path to public directory
    {
        branch: 'gh-pages',
        repo: 'https://github.com/Macario12/Portafolio.git', // Update to point to your repository  
        user: {
            name: 'Macario12', // update to use your name
            email: 'arielmacario.11@gmail.com' // Update to use your email
        }
    },
    () => {
        console.log('Deploy Complete!')
    }
)