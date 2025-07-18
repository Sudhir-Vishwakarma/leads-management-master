// import { getConnectedWABA } from './firebase';

// export interface WhatsAppTemplate {
//   id: string;
//   name: string;
//   content: string;
//   hasImage: boolean;
//   category: string;
//   status: string;
// }

// export const fetchWhatsAppTemplates = async (
//   userPhone: string,
//   nextPage?: string
// ): Promise<{ templates: WhatsAppTemplate[]; nextPage: string | null }> => {
//   try {
//     if (!userPhone) {
//       throw new Error("User phone number is required");
//     }
    
//     const phoneNumberId = await getConnectedWABA(userPhone);
//     const url = nextPage || `https://graph.facebook.com/v22.0/${phoneNumberId}/message_templates`;
    
//     const response = await fetch(url, {
//       headers: {
//         Authorization: `Bearer ${import.meta.env.VITE_WHATSAPP_TOKEN}`
//       }
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(
//         `API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`
//       );
//     }

//     const data = await response.json();
    
//     const templates: WhatsAppTemplate[] = data.data.map((template: any) => {
//       const bodyComponent = template.components.find((c: any) => c.type === "BODY");
//       const headerComponent = template.components.find((c: any) => c.type === "HEADER");
      
//       return {
//         id: template.id,
//         name: template.name,
//         content: bodyComponent?.text || '',
//         hasImage: headerComponent?.format === "IMAGE",
//         category: template.category,
//         status: template.status
//       };
//     });

//     return {
//       templates,
//       nextPage: data.paging?.next || null
//     };
//   } catch (error) {
//     console.error("Error fetching WhatsApp templates:", error);
//     throw error;
//   }
// };












import { getConnectedWABA } from './firebase';

export interface WhatsAppTemplateButton {
  type: 'URL' | 'PHONE_NUMBER' | 'QUICK_REPLY';
  text: string;
  url?: string;
  phoneNumber?: string;
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  content: string;
  hasImage: boolean;
  category: string;
  status: string;
  headerUrl?: string;
  footerText?: string;
  buttons?: WhatsAppTemplateButton[];
}

export const fetchWhatsAppTemplates = async (
  userPhone: string,
  nextPage?: string
): Promise<{ templates: WhatsAppTemplate[]; nextPage: string | null }> => {
  try {
    if (!userPhone) {
      throw new Error("User phone number is required");
    }
    
    const phoneNumberId = await getConnectedWABA(userPhone);
    const url = nextPage || `https://graph.facebook.com/v22.0/${phoneNumberId}/message_templates`;
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_WHATSAPP_TOKEN}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`
      );
    }

    const data = await response.json();
    
    const templates: WhatsAppTemplate[] = data.data.map((template: any) => {
      const bodyComponent = template.components.find((c: any) => c.type === "BODY");
      const headerComponent = template.components.find((c: any) => c.type === "HEADER");
      const footerComponent = template.components.find((c: any) => c.type === "FOOTER");
      const buttonsComponent = template.components.find((c: any) => c.type === "BUTTONS");
      
      // Extract header URL if available
      let headerUrl = '';
      if (headerComponent?.example?.header_handle?.[0]) {
        headerUrl = headerComponent.example.header_handle[0];
      }
      
      // Extract buttons if available
      const buttons: WhatsAppTemplateButton[] = [];
      if (buttonsComponent?.buttons) {
        buttonsComponent.buttons.forEach((button: any) => {
          if (button.type === 'URL') {
            buttons.push({
              type: 'URL',
              text: button.text,
              url: button.url
            });
          } else if (button.type === 'PHONE_NUMBER') {
            buttons.push({
              type: 'PHONE_NUMBER',
              text: button.text,
              phoneNumber: button.phone_number
            });
          } else if (button.type === 'QUICK_REPLY') {
            buttons.push({
              type: 'QUICK_REPLY',
              text: button.text
            });
          }
        });
      }
      
      return {
        id: template.id,
        name: template.name,
        content: bodyComponent?.text || '',
        hasImage: headerComponent?.format === "IMAGE",
        category: template.category,
        status: template.status,
        headerUrl,
        footerText: footerComponent?.text,
        buttons: buttons.length > 0 ? buttons : undefined
      };
    });

    return {
      templates,
      nextPage: data.paging?.next || null
    };
  } catch (error) {
    console.error("Error fetching WhatsApp templates:", error);
    throw error;
  }
};