
import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import "./FlowingMenu.css";

export interface FlowingMenuItem {
  text: string;
  onClick: () => void;
  icon?: React.ReactNode;
}

interface FlowingMenuProps {
  items: FlowingMenuItem[];
  className?: string;
}

export const FlowingMenu: React.FC<FlowingMenuProps> = ({ items, className = "" }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!menuRef.current) return;
    
    const menuItems = menuRef.current.querySelectorAll('.menu-item');
    
    menuItems.forEach((item) => {
      const bgElement = item.querySelector('.menu-item-bg');
      
      if (!bgElement) return;
      
      item.addEventListener('mouseenter', () => {
        gsap.to(bgElement, {
          duration: 0.4,
          y: 0,
          opacity: 1,
          ease: "power2.out"
        });
      });
      
      item.addEventListener('mouseleave', () => {
        gsap.to(bgElement, {
          duration: 0.4,
          y: 40,
          opacity: 0,
          ease: "power2.in"
        });
      });
    });
    
    return () => {
      menuItems.forEach((item) => {
        item.removeEventListener('mouseenter', () => {});
        item.removeEventListener('mouseleave', () => {});
      });
    };
  }, [items]);
  
  return (
    <div className={`menu-wrap ${className}`} ref={menuRef}>
      <nav className="flowing-menu">
        <ul>
          {items.map((item, index) => (
            <li key={index} className="menu-item" onClick={item.onClick}>
              <span className="menu-item-bg"></span>
              <div className="menu-item-content">
                {item.icon && <span className="menu-item-icon">{item.icon}</span>}
                <span className="menu-item-text">{item.text}</span>
              </div>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};
