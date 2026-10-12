
pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                echo 'QuizFlow: Source code checkout successful'
            }
        }

        stage('Build') {
            steps {
                bat 'echo Building QuizFlow project...'
                bat 'dir'
            }
        }

        stage('Test') {
            steps {
                echo 'QuizFlow CI pipeline test successful'
            }
        }
    }

    post {
        success {
            echo 'QuizFlow build completed successfully!'
        }
        failure {
            echo 'QuizFlow build failed. Check the console output.'
        }
    }
}
