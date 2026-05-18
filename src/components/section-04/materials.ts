export type RecipeMaterial = {
  id: string;
  name: string;
  image: string;
  resultImage: string;
};

export const RECIPE_MATERIALS: RecipeMaterial[] = [
  {
    id: "1",
    name: "Material 1",
    image: "/section-04/material-1a.jpg",
    resultImage: "/section-04/material-1b.jpg",
  },
  {
    id: "2",
    name: "Material 2",
    image: "/section-04/material-2a.jpg",
    resultImage: "/section-04/material-2b.jpg",
  },
  {
    id: "3",
    name: "Material 3",
    image: "/section-04/material-3a.jpg",
    resultImage: "/section-04/material-3b.jpg",
  },
  {
    id: "4",
    name: "Material 4",
    image: "/section-04/material-4a.jpg",
    resultImage: "/section-04/material-4b.jpg",
  },
];
