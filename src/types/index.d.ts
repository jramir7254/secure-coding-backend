
declare global {

    type AnswerChoices = 'runtime' | 'logic' | 'compile' | 'vulnerability' | null;
    type QuestionTags = 'runtime' | 'logic' | 'compile' | 'vulnerability' | null;
    type QuestionTypes = 'mcq' | 'break' | 'fix' | 'exploit' | null
    type Difficulties = 'easy' | 'medium' | 'hard'


    interface CodeFile {
        id: string
        questionId: string
        name: string,
        language: string,
        value: string,
        displayOrder: number
        editableRanges: number[]
    }


    interface QuestionSchema {
        id: number
        title: string
        type: QuestionTypes
        difficulty: number[]
        tags: QuestionTags[]
        description?: string
        explanation?: string
        codeFiles: CodeFile[]
    }


    interface QuestionAttempt {
        id: number
        questionId: string
        teamId: string
        startedAt: string
        completedAt: string
        score: number
    }
}
export { }

