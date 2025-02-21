import UserLayout from "../layouts/userLayout";

const About = () => {
  return (
    <UserLayout>
      <h2 className="text-2xl font-bold text-black">Sobre</h2>
      <p className="text-gray mt-2">Este sistema foi desenvolvido para gerenciar informações.</p>
    </UserLayout>
  );
};

export default About;
