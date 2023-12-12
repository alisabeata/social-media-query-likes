export class SocialNetworkQueries {

    constructor({ fetchCurrentUser }) {
        this.fetchCurrentUser = fetchCurrentUser
        this.cache = []
    }

    async findPotentialLikes(minimalScore) {
        let potentialLikes = []

        try {
            let userData = await this.fetchCurrentUser()

            if (!userData) {
                if (this.cache.length > 0) {
                    userData = this.cache
                }
            }

            let score = userData.friends
                .flatMap(({likes}) => {
                    return [...new Set(likes)].filter(value => !userData.likes.includes(value)) 
                })
                .reduce((prevBooks, book) => ({
                    ...prevBooks, 
                    [book]: prevBooks[book] + 1 || 1
                }), {})

            for (const [key, value] of Object.entries(score)) {    
                score[key] = value / userData.friends?.length
            }

            potentialLikes = Object.keys(score)
                .filter(cur => score[cur] > minimalScore)
                // Title filter
                .sort((title1, title2) => 
                    title1.localeCompare(title2, "en", { sensitivity: "base" }) 
                )
                // Popularity filter
                .sort((a, b) => score[b] - score[a])

            this.cache = potentialLikes

        } catch (err) {
            potentialLikes = this.cache
        }

        return potentialLikes
    }
}
